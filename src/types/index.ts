export interface Task {
  id: string;
  title: string;
  description: string;
  done: boolean;
  position: number;
}

export interface DroppableProvided {
  innerRef: (element: HTMLElement | null) => void;
  droppableProps: {
    'data-rbd-droppable-id': string;
    'data-rbd-droppable-context-id': string;
  };
  placeholder?: React.ReactNode;
}

export interface DraggableProvided {
  innerRef: (element: HTMLElement | null) => void;
  draggableProps: {
    'data-rbd-draggable-context-id': string;
    'data-rbd-draggable-id': string;
    style?: React.CSSProperties;
  };
  dragHandleProps: {
    'data-rbd-drag-handle-draggable-id': string;
    'data-rbd-drag-handle-context-id': string;
    'aria-describedby': string;
    role: string;
    tabIndex: number;
    draggable: boolean;
    onDragStart: (event: React.DragEvent<HTMLElement>) => void;
  } | null;
}

export interface DragResult {
  destination?: {
    droppableId: string;
    index: number;
  };
  source: {
    droppableId: string;
    index: number;
  };
  draggableId: string;
} 