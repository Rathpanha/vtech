import { firebaseConfig } from "@/functions/env";
import type { NextApiRequest, NextApiResponse } from 'next';
import { TodoList } from "../../../types/TodoList";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TodoList[] | { success: boolean, message: string }>
) {
  const { id } = req.query;

  if(req.method === "PUT") {
    const { success, message } = await validateEditingRecord(req.body);
    
    if(success) {
      // Retrieving record to get the value of the key first
      // Because firebase only support editing by key for REST API
      const { success, message, key } = await gettingRecord(String(id));

      if(success) {
        // Editing record by key
        const { success, message } = await editingRecord(key, req.body);

        if(success) {
          res.status(200).json({ success, message });
        } else {
          res.status(500).json({ success, message });
        }
      } else {
        res.status(500).json({ success, message });
      }
    } else {
      res.status(400).json({ success, message });
    }
  } else if(req.method === "DELETE") {
    // Retrieving record to get the value of the key first
    // Because firebase only support deleting by key for REST API
    const { success, message, key } = await gettingRecord(String(id));

    if(success) {
      // Deleting record by key
      const { success, message } = await deletingRecord(key);

      if(success) {
        res.status(200).json({ success, message });
      } else {
        res.status(500).json({ success, message });
      }
    } else {
      res.status(500).json({ success, message });
    }
  }
}

const gettingRecord = async (id: string) => {
  let success = true;
  let message = "";
  let key = "";

  const response = await fetch(`${firebaseConfig.databaseURL}/todolist.json?orderBy="id"&equalTo="${id}"`, {
    method: "GET",
    headers: {
      Accept: 'application.json',
      'Content-Type': 'application/json'
    }
  });
  
  if(response.ok) {
    success = true;
    message = "Success!"
  } else {
    success = false;
    message = "Error while retrieving record to delete!"
  }

  const data = await response.json();
  key = Object.keys(data)[0];

  return { success, message, key };
}

const editingRecord = async (key: string, todoList: TodoList) => {
  let success = true;
  let message = "";

  const response = await fetch(`${firebaseConfig.databaseURL}/todolist/${key}.json`, {
    method: "PUT",
    headers: {
      Accept: 'application.json',
      'Content-Type': 'application/json'
    }, 
    body: JSON.stringify(todoList)
  });

  if(response.ok) {
    success = true;
    message = "Success!"
  } else {
    success = false;
    message = "Error while editing record!"
  }
  
  return { success, message };
}

const deletingRecord = async (key: string) => {
  let success = true;
  let message = "";

  const response = await fetch(`${firebaseConfig.databaseURL}/todolist/${key}.json`, {
    method: "DELETE",
    headers: {
      Accept: 'application.json',
      'Content-Type': 'application/json'
    }
  });

  if(response.ok) {
    success = true;
    message = "Success!"
  } else {
    success = false;
    message = "Error while deleting record!"
  }
  
  return { success, message };
}

const validateEditingRecord = async (todoList: TodoList) => {
  let success = true;
  let message = "";

  // Validate empty
  if(!todoList.todo) {
    success = false;
    message = "Record can not be empty!";
  } else {
    // Validate duplicate record
    const response = await fetch(`${firebaseConfig.databaseURL}/todolist.json?orderBy="todo"&equalTo="${todoList.todo}"`);

    if(!response.ok) {
      success = false;
      message = "Error while validating record!";
    } else {
      const data = await response.json();
      const key = Object.keys(data)[0];
      if(JSON.stringify(data) !== "{}" && data[key].id !== todoList.id) {
        success = false;
        message = "Record is duplicated!"
      }
    }
  }

  return { success, message };
}