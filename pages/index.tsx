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

  const addRecord = (todo: string) => {
    setLoadingText("Adding todo list...");
    fetch("/api/todo", {
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

      <main>
        <h1>Todo List</h1>
        <input 
          autoComplete="off"
          onKeyDown={(e) => {
            if(e.key === "Enter") {
              addRecord(e.currentTarget.value);
            }
          }}
        />
        <p>{loadingText}</p>

        <ul>
          {
            todoList.map(list => {
              return (<li key={list.id}>{list.todo}</li>);
            })
          }
        </ul>
      </main>
    </>
  );
}
