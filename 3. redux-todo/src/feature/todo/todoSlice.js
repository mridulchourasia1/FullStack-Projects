import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  todos: []
};

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    addTodo: (state, action) => {
      const newTodo = {
        id: Date.now(),
        text: action.payload,
        completed: false
      };
      state.todos.push(newTodo);
    },
    toggleTodo: (state, action) => {
      const todo = state.todos.find(todo => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    deleteTodo: (state, action) => {
      state.todos = state.todos.filter(todo => todo.id !== action.payload);
    },
    clearAllTodos: (state) => {
      state.todos = [];
    }
  }
});

export const { addTodo, toggleTodo, deleteTodo, clearAllTodos } = todoSlice.actions;
export default todoSlice.reducer;
