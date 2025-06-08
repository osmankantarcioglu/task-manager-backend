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
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

interface Task {
  id: string;
  title: string;
  description: string;
  done: boolean;
  position: number;
}

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
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
      console.log('Fetching tasks...');
      const token = localStorage.getItem('token');
      console.log('Current token:', token);
      
      const response = await api.get('/tasks');
      console.log('Tasks response:', response.data);
      
      setTasks(response.data.sort((a: Task, b: Task) => a.position - b.position));
      setError('');
    } catch (err: any) {
      console.error('Error fetching tasks:', err.response || err);
      setError('Failed to load tasks: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);

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
      console.log('Submitting task...');
      if (editingTask) {
        const response = await api.put(`/tasks/${editingTask.id}`, {
          title,
          description,
          done,
          position: editingTask.position
        });
        console.log('Update task response:', response.data);
      } else {
        const position = tasks.length > 0 ? Math.max(...tasks.map(t => t.position)) + 1 : 0;
        const response = await api.post('/tasks', {
          title,
          description,
          done,
          position
        });
        console.log('Create task response:', response.data);
      }
      await fetchTasks();
      handleCloseModal();
      setError('');
    } catch (err: any) {
      console.error('Error saving task:', err.response || err);
      setError('Failed to save task: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      const updatedTasks = tasks
        .filter(t => t.id !== taskId)
        .map((task, index) => ({
          ...task,
          position: index
        }));
      
      if (updatedTasks.length > 0) {
        await api.put('/tasks/reorder', {
          taskIds: updatedTasks.map(task => task.id)
        });
      }
      
      await fetchTasks();
      setError('');
    } catch (err: any) {
      console.error('Error deleting task:', err.response || err);
      setError('Failed to delete task: ' + (err.response?.data?.message || err.message));
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
      await api.put('/tasks/reorder', {
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
                                    await api.put(`/tasks/${task.id}`, {
                                      title: task.title,
                                      description: task.description,
                                      done: !task.done,
                                      position: task.position
                                    });
                                    await fetchTasks();
                                    setError('');
                                  } catch (err: any) {
                                    console.error('Error updating task status:', err.response || err);
                                    setError('Failed to update task status: ' + (err.response?.data?.message || err.message));
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