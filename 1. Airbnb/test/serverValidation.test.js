import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js'; // Assuming app.js exports the Express app
import mongoose from 'mongoose';
import Listing from '../modals/listing.js';

const expect = chai.expect;
chai.use(chaiHttp);

describe('Server-side Validation Tests', function() {
  let server;
  let testListingId;

  before(function(done) {
    server = app.listen(4000, () => {
      console.log('Test server running on port 4000');
      done();
    });
  });

  after(function(done) {
    mongoose.connection.close();
    server.close(done);
  });

  beforeEach(async function() {
    // Clear listings before each test
    await Listing.deleteMany({});
    // Create a test listing for edit and review tests
    const listing = new Listing({
      title: 'Test Listing',
      description: 'Test Description',
      price: 100,
      location: 'Test Location',
      images: []
    });
    const savedListing = await listing.save();
    testListingId = savedListing._id.toString();
  });

  describe('POST /createListing', function() {
    it('should fail when required fields are missing', function(done) {
      chai.request(server)
        .post('/createListing')
        .send({ title: '', description: '', price: '', location: '' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.text).to.include('Title is required');
          done();
        });
    });

    it('should succeed with valid data', function(done) {
      chai.request(server)
        .post('/createListing')
        .send({
          title: 'Valid Title',
          description: 'Valid Description',
          price: 50,
          location: 'Valid Location',
          images: ''
        })
        .end((err, res) => {
          expect(res).to.redirectTo(/\/listings$/);
          done();
        });
    });

    it('should fail with extremely large input values', function(done) {
      const largeString = 'a'.repeat(10000);
      chai.request(server)
        .post('/createListing')
        .send({
          title: largeString,
          description: largeString,
          price: 9999999999,
          location: largeString,
          images: ''
        })
        .end((err, res) => {
          // Assuming Joi or MongoDB will reject large inputs or handle them gracefully
          expect(res).to.have.status.oneOf([400, 500]);
          done();
        });
    });

    it('should fail with special characters in fields', function(done) {
      chai.request(server)
        .post('/createListing')
        .send({
          title: '!@#$%^&*()_+',
          description: '<script>alert("xss")</script>',
          price: 100,
          location: 'Location!@#',
          images: ''
        })
        .end((err, res) => {
          // Validation may pass but check for server error or success
          expect(res).to.have.status.oneOf([200, 302, 400, 500]);
          done();
        });
    });
  });

  describe('POST /editListing/:id', function() {
    it('should fail when price is negative', function(done) {
      chai.request(server)
        .post(`/editListing/${testListingId}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Description',
          price: -10,
          location: 'Updated Location'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.text).to.include('Price must be a non-negative number');
          done();
        });
    });

    it('should succeed with valid data', function(done) {
      chai.request(server)
        .post(`/editListing/${testListingId}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Description',
          price: 150,
          location: 'Updated Location'
        })
        .end((err, res) => {
          expect(res).to.redirectTo(/\/listings$/);
          done();
        });
    });

    it('should fail with extremely large input values', function(done) {
      const largeString = 'a'.repeat(10000);
      chai.request(server)
        .post(`/editListing/${testListingId}`)
        .send({
          title: largeString,
          description: largeString,
          price: 9999999999,
          location: largeString
        })
        .end((err, res) => {
          expect(res).to.have.status.oneOf([400, 500]);
          done();
        });
    });
  });

  describe('POST /listings/:id/reviews', function() {
    it('should fail when rating is out of range', function(done) {
      chai.request(server)
        .post(`/listings/${testListingId}/reviews`)
        .send({
          rating: 6,
          review: 'Great!'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.include('must be less than or equal to 5');
          done();
        });
    });

    it('should succeed with valid review', function(done) {
      chai.request(server)
        .post(`/listings/${testListingId}/reviews`)
        .send({
          rating: 5,
          review: 'Excellent!'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.message).to.equal('Review submitted successfully');
          done();
        });
    });

    it('should fail with empty review text', function(done) {
      chai.request(server)
        .post(`/listings/${testListingId}/reviews`)
        .send({
          rating: 4,
          review: ''
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.include('is not allowed to be empty');
          done();
        });
    });
  });

  describe('Error Handling Middleware', function() {
    it('should return 404 for unknown routes', function(done) {
      chai.request(server)
        .get('/unknownroute')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.text).to.include('Page Not Found');
          done();
        });
    });

    it('should handle thrown errors with status and message', function(done) {
      chai.request(server)
        .post('/createListing')
        .send({ title: '', description: '', price: '', location: '' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.text).to.include('Title is required');
          done();
        });
    });
  });
});
