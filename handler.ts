import { handler as createTaskHandler } from './handlers/createTask';
import { handler as bulkCreateTasksHandler } from './handlers/bulkCreateTasks';
import { handler as getTaskHandler } from './handlers/getTask';
import { handler as listTasksHandler } from 'handlers/listTasks';
import { handler as deleteTaskHandler } from './handlers/deleteTask';
import { handler as updateTaskHandler } from './handlers/updateTask';

export { createTaskHandler, bulkCreateTasksHandler, getTaskHandler, listTasksHandler, deleteTaskHandler, updateTaskHandler };
