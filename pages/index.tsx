import { firebaseConfig } from '@/functions/env';
import { TodoList } from '@/types/TodoList';
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const todoListRef = ref(db, "todolist");

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ todoList, setTodoList ] = useState<TodoList[]>([]);
  const [ action, setAction ] = useState<"add" | "edit">("add");
  const [ recordEdit, setRecordEdit ] = useState<TodoList | null>(null);
  const [ inputText, setInputText ] = useState("");
  const [ loadingText, setLoadingText ] = useState("");

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

    fetch(`/api/todo`, {
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
        if(res.success) {
          setInputText("");
        } else {
          alert(res.message);
        }
      });
  }

  const editRecord = (todoList: TodoList) => {
    setLoadingText("Editing todo list...");

    fetch(`/api/todo/${todoList.id}`, {
      method: "PUT",
      headers: {
        Accept: 'application.json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        todoList
      })
    })
      .then((res) => res.json())
      .then((res) => {
        setLoadingText("");
        if(res.success) {
          setAction("add");
          setRecordEdit(null);
          setInputText("");
        } else {
          alert(res.message);
        }
      });
  }

  const deleteRecord = (id: string) => {
    setLoadingText("Deleting todo list...");

    fetch(`/api/todo/${id}`, {
      method: "DELETE",
      headers: {
        Accept: 'application.json',
        'Content-Type': 'application/json'
      }
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
              if(action === "add") {
                addRecord(e.currentTarget.value);
              } else if(action === "edit") {
                if(recordEdit) {
                  editRecord({
                    id: recordEdit.id,
                    todo: e.currentTarget.value,
                    isCompleted: recordEdit.isCompleted,
                    createdAt: recordEdit.createdAt
                  });
                }
              }
            }
          }}
          value={inputText}
          onChange={(e) => {
            setInputText(e.currentTarget.value);
          }}
        />
        <p>{loadingText}</p>

        <div style={{ padding: "1rem" }}>
          <ul>
            {
              todoList.map(list => {
                const todoText = list.isCompleted ? <s>{list.todo}</s> : list.todo;
                
                return (
                  <li key={list.id} style={{ padding: "0.5rem 0"}}>
                    {todoText} 
                    <button style={{ margin: "0.25rem" }} onClick={() => {
                      deleteRecord(list.id);
                    }}>Remove</button>

                    <button style={{ margin: "0.25rem" }} onClick={() => {
                      setAction("edit");
                      setRecordEdit(list);
                      setInputText(list.todo);
                    }}>Edit</button>

                    <button style={{ margin: "0.25rem" }} onClick={() => {
                      editRecord({
                        id: list.id,
                        todo: list.todo,
                        isCompleted: !list.isCompleted,
                        createdAt: list.createdAt
                      })
                    }}>Mark as {list.isCompleted ? "Incomplete" : "Complete"}</button>
                  </li>
                );
              })
            }
          </ul>
        </div>
      </main>
    </>
  );
}
