import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addTodo, toggleTodo, deleteTodo } from '../feature/todo/todoSlice';
import TodoInput from './TodoInput';
import TodoList from './TodoList';

const Todo = () => {
  const [input, setInput] = useState('');
  const todos = useSelector(state => state.todo.todos);
  const dispatch = useDispatch();

  const handleAddTodo = () => {
    if (input.trim() !== '') {
      dispatch(addTodo(input));
      setInput('');
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleToggleTodo = (id) => {
    dispatch(toggleTodo(id));
  };

  const handleDeleteTodo = (id) => {
    dispatch(deleteTodo(id));
  };

  return (
    <div>
      <h1>Todo App</h1>
      <TodoInput input={input} onInputChange={handleInputChange} onAddTodo={handleAddTodo} />
      <TodoList todos={todos} onToggleTodo={handleToggleTodo} onDeleteTodo={handleDeleteTodo} />
    </div>
  );
};

export default Todo;
