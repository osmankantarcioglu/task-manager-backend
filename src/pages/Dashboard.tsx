import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';

interface Task {
  id: string;
  title: string;
  description: string;
  done: boolean;
  position: number;
}

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'done' | 'notDone'>('all');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [done, setDone] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data.sort((a: Task, b: Task) => a.position - b.position));
      setError('');
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description);
      setDone(task.done);
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setDone(false);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setDone(false);
  };

  const handleSubmit = async () => {
    try {
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask.id}`, {
          title,
          description,
          done,
        });
      } else {
        await axios.post('/api/tasks', {
          title,
          description,
          done,
          position: tasks.length,
        });
      }
      fetchTasks();
      handleCloseModal();
    } catch (err) {
      setError('Failed to save task');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedTasks = items.map((task, index) => ({
      ...task,
      position: index,
    }));

    setTasks(updatedTasks);

    try {
      await axios.put('/api/tasks/reorder', {
        taskIds: updatedTasks.map(task => task.id),
      });
    } catch (err) {
      setError('Failed to update task order');
      fetchTasks();
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'done') return task.done;
    if (filter === 'notDone') return !task.done;
    return true;
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Tasks
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small">
            <InputLabel>Filter</InputLabel>
            <Select
              value={filter}
              label="Filter"
              onChange={(e) => setFilter(e.target.value as 'all' | 'done' | 'notDone')}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="done">Done</MenuItem>
              <MenuItem value="notDone">Not Done</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={() => handleOpenModal()}
          >
            Add New Task
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              {filteredTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{
                        opacity: task.done ? 0.7 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="h6" sx={{ textDecoration: task.done ? 'line-through' : 'none' }}>
                              {task.title}
                            </Typography>
                            <Typography color="text.secondary">
                              {task.description}
                            </Typography>
                          </Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={task.done}
                                onChange={async () => {
                                  try {
                                    await axios.put(`/api/tasks/${task.id}`, {
                                      ...task,
                                      done: !task.done,
                                    });
                                    fetchTasks();
                                  } catch (err) {
                                    setError('Failed to update task status');
                                  }
                                }}
                              />
                            }
                            label="Done"
                          />
                        </Box>
                      </CardContent>
                      <CardActions>
                        <IconButton size="small" onClick={() => handleOpenModal(task)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(task.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Add New Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={done}
                  onChange={(e) => setDone(e.target.checked)}
                />
              }
              label="Mark as done"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTask ? 'Save Changes' : 'Add Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 