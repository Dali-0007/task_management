import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import useTaskComments from "../hooks/useTaskComments";
import { formatDateTime } from "../utils/taskFormatters";
import { commentSx } from "./taskStyles";

const COMMENT_MAX = 2000;

export default function TaskComments({ taskId, canComment }) {
  const { comments, isLoading, error, addComment, reload } = useTaskComments(taskId);
  const [content, setContent] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    if (!content.trim()) {
      setSubmitError("Write a comment before posting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const message = await addComment(content.trim());

    if (message) {
      setSubmitError(message);
    } else {
      setContent("");
    }
    setIsSubmitting(false);
  }

  return (
    <Box component="section" aria-labelledby="task-comments-heading">
      <Typography id="task-comments-heading" variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        Discussion ({comments.length})
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 1.5 }}
          action={
            <Button color="inherit" size="small" onClick={reload}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {isLoading && comments.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={24} aria-label="Loading comments" />
        </Box>
      ) : !error && comments.length === 0 ? (
        <Typography color="text.secondary" variant="body2" sx={{ py: 1 }}>
          No comments yet.
        </Typography>
      ) : (
        <Box>
          {comments.map((comment) => (
            <Box key={comment.id} sx={commentSx}>
              <Typography variant="body2" fontWeight={650}>
                {comment.author_name}{" "}
                <Typography component="span" variant="caption" color="text.secondary">
                  · {formatDateTime(comment.created_at)}
                </Typography>
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {comment.content}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {canComment ? (
        <Stack component="form" onSubmit={handleSubmit} spacing={1} sx={{ mt: 2 }}>
          <TextField
            label="Add a comment"
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setSubmitError("");
            }}
            multiline
            minRows={2}
            error={Boolean(submitError)}
            helperText={submitError || `${content.length}/${COMMENT_MAX}`}
            slotProps={{ htmlInput: { maxLength: COMMENT_MAX } }}
          />
          <Box>
            <Button type="submit" variant="contained" size="small" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post comment"}
            </Button>
          </Box>
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          This project is archived, so new comments are disabled.
        </Typography>
      )}
    </Box>
  );
}
