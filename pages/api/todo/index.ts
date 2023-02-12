import { firebaseConfig } from "@/functions/env";
import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { TodoList } from "./../../../types/TodoList";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TodoList[] | { success: boolean, message: string }>
) {
  if(req.method === "POST") {
    const { success, message } = await validateAddingRecord(req.body.todo);

    if(success) {
      await fetch(`${firebaseConfig.databaseURL}/todolist.json`, {
        method: "POST",
        headers: {
          Accept: 'application.json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: uuidv4(),
          todo: req.body.todo,
          isCompleted: false,
          createdAt: Date.now(),
        })
      })
        .then(() => {
          res.status(200).json({ success: true, message: "Success!" });
        }).catch(e => {
          res.status(500).json({ success: false, message: "Error while performing action!" });
        });
    } else {
      res.status(400).json({ success, message });
    }
  } else if(req.method === "GET") {
    const todoList: TodoList[] = [];

    await fetch(`${firebaseConfig.databaseURL}/todolist.json`)
      .then(res => res.json())
      .then(data => {
        for(const key in data) {
          todoList.push(data[key]);
        }

        res.status(200).json(todoList);
      }).catch(e => {
        res.status(500).json({ success: false, message: "Error while fetching data!" });
      });
  }
}

const validateAddingRecord = async (todo: string) => {
  let success = true;
  let message = "";

  // Validate empty
  if(!todo) {
    success = false;
    message = "Todo can not be empty!";
  } else {
    // Validate duplicate record
    await fetch(`${firebaseConfig.databaseURL}/todolist.json?orderBy="todo"&equalTo="${todo}"`)
    .then(res => res.json())
    .then(data => {
      if(JSON.stringify(data) !== "{}") {
        success = false;
        message = "Todo record is duplicated!"
      }
    }).catch(e => {
      success = false;
      message = "Error while validating data!";
    });
  }

  return { success, message };
}