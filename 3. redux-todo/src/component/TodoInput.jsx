import React from 'react';

const TodoInput = ({ input, onInputChange, onAddTodo }) => {
  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={onInputChange}
        placeholder="Add a new todo"
      />
      <button onClick={onAddTodo}>Add</button>
    </div>
  );
};

export default TodoInput;
