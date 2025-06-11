import { handler as createTaskHandler } from './handlers/createTask';
import { handler as getTaskHandler } from './handlers/getTask';
import { handler as listTasksHandler } from 'handlers/listTasks';
import { handler as deleteTaskHandler } from './handlers/deleteTask';
import { handler as updateTaskHandler } from './handlers/updateTask';

export { createTaskHandler, getTaskHandler, listTasksHandler, deleteTaskHandler, updateTaskHandler };
