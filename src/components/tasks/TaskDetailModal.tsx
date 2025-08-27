// Archivo: src/components/tasks/TaskDetailModal.tsx

import { useState } from 'react';
import { toast } from 'sonner';
import type { Task } from '../../types/task.types';
import './TaskDetailModal.css';

interface Props {
    task: Task;
    onClose: () => void;
    // Futura función para guardar comentarios en el backend
    // onAddComment: (taskId: number, commentText: string) => void;
}

const TaskDetailModal = ({ task, onClose }: Props) => {
    const [newComment, setNewComment] = useState('');
    // Estado temporal para simular comentarios, hasta que el backend lo soporte
    const [comments, setComments] = useState([
        { author: 'Sistema', text: 'Tarea creada.', date: new Date(task.createdAt).toLocaleString() },
    ]);

    const handleAddComment = () => {
        if (!newComment.trim()) {
            toast.info('El comentario no puede estar vacío.');
            return;
        }
        // Simulación: Añadimos el comentario al estado local
        setComments(prev => [...prev, {
            author: 'Operario (Tú)',
            text: newComment,
            date: new Date().toLocaleString(),
        }]);
        setNewComment('');
        toast.success('Comentario añadido (simulación).');
        // En un futuro, aquí llamarías a onAddComment(task.id, newComment);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container task-detail-modal">
                <div className="modal-header">
                    <h3>Detalle de la Tarea</h3>
                    <button onClick={onClose} className="btn-close">&times;</button>
                </div>
                <div className="modal-content">
                    <h4>{task.description}</h4>
                    <div className="task-meta">
                        <span><strong>Finca:</strong> {task.farmName}</span>
                        <span><strong>Sector:</strong> {task.sectorName || 'N/A'}</span>
                        <span><strong>Creada:</strong> {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="comments-section">
                        <h5>Bitácora y Comentarios</h5>
                        <div className="comments-list">
                            {comments.map((comment, index) => (
                                <div key={index} className="comment-item">
                                    <p className="comment-text">{comment.text}</p>
                                    <span className="comment-author">Por: <strong>{comment.author}</strong> el {comment.date}</span>
                                </div>
                            ))}
                        </div>
                        <div className="comment-form">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Añadir un comentario o actualización..."
                                rows={3}
                            />
                            <button onClick={handleAddComment} className="btn-add-comment">
                                Añadir Comentario
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;