import { Notification } from "./interfaces";

export const initialData:{notifications: Notification[]} = {
  notifications: [
    {
      id: 1,
      title: 'Entrega de Proyecto Programación',
      description: 'Debes entregar el proyecto de gestión de estudiantes antes de la fecha límite.',
      dueDate: '15/06/2025',
      completed: false
    },
    {
      id: 2,
      title: 'Examen Matemática Discreta',
      description: 'Examen parcial del tema 3: Teoría de grafos.',
      dueDate: '20/06/2025',
      completed: false
    },
    {
      id: 3,
      title: 'Práctica de Laboratorio',
      description: 'Práctica de bases de datos con MySQL.',
      dueDate: '10/06/2025',
      completed: false
    }
  ]
};
