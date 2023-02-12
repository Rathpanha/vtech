import { firebaseConfig } from '@/functions/env';
import { TodoList } from '@/types/TodoList';
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import Head from 'next/head';
import { useEffect, useState } from 'react';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const todoListRef = ref(db, "todolist");

export default function Home() {
  const [todoList, setTodoList] = useState<TodoList[]>([]);
  const [loadingText, setLoadingText] = useState("");

  useEffect(() => {
    setLoadingText("Loading todo list...");
    fetch("/api/todo", {
      method: "GET",
      headers: {
        Accept: 'application.json',
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((todoList: TodoList[]) => {
        setTodoList(todoList);
        setLoadingText("");
      })

    // Listen for realtime update on firebase database
    onValue(todoListRef, (snapshot) => {
      const todoList: TodoList[] = [];
      snapshot.forEach((childSnapsot) => {
        todoList.push(childSnapsot.val());
      });
  
      setTodoList(todoList);
    })
  }, []);
  
  const addRecord = async (todo: string) => {
    setLoadingText("Adding todo list...");
    await fetch("/api/todo", {
      method: "POST",
      headers: {
        Accept: 'application.json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        todo
      })
    })
      .then((res) => res.json())
      .then((res) => {
        setLoadingText("");
        if(!res.success) {
          alert(res.message);
        }
      });
  }

  return (
    <>
      <Head>
        <title>Todo List</title>
        <meta name="description" content="Todo list." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ padding: "1rem" }}>
        <h1>Todo List</h1>
        <input 
          placeholder="Todo"
          autoComplete="off"
          onKeyDown={(e) => {
            if(e.key === "Enter") {
              addRecord(e.currentTarget.value);
            }
          }}
        />
        <p>{loadingText}</p>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Todo</th>
              <th>Is Completed</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {
              todoList.map(list => {
                return (
                  <tr key={list.id}>
                    <td>{list.id}</td>
                    <td>{list.todo}</td>
                    <td>{list.isCompleted ? "Yes" : "No"}</td>
                    <td>{new Date(list.createdAt).toLocaleDateString()} {new Date(list.createdAt).toLocaleTimeString()}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </main>
    </>
  );
}
