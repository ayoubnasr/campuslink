import { useEffect, useState } from "react";
import { get_post_comments, add_post_comment } from "./comment_requests.js";

const maxCommentLen = 2500;

/**
 * Comment list and input shown under a post when its comment button is clicked.
 */
const CommentSection = ({ post_id }) => {

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadComments = async () => {
            setLoading(true);
            const result = await get_post_comments(post_id);
            if (result.success) {
                setComments(result.comments);
            }
            else {
                setError(result.message || "Could not load comments.");
            }
            setLoading(false);
        };

        loadComments();

    }, [post_id]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const text = newComment.trim();
        if (!text) return;

        setSending(true);
        setError("");
        const result = await add_post_comment(post_id, text);

        if (result.success) {
            setNewComment("");
            const refreshed = await get_post_comments(post_id);
            if (refreshed.success) setComments(refreshed.comments);
        }
        else {
            setError(result.message || "Could not post your comment.");
        }
        setSending(false);
    };

    const displayName = (c) => (c.firstname || c.familyname)
        ? `${c.firstname || ""} ${c.familyname || ""}`.trim()
        : c.username;

    return (
        <div style={{ borderTop: "1px solid #eee", marginTop: "10px", paddingTop: "10px" }}>

            {loading && <p style={{ color: "#888", fontSize: "14px" }}>Loading comments...</p>}

            {!loading && comments.length === 0 && (
                <p style={{ color: "#888", fontSize: "14px" }}>No comments yet. Be the first to comment!</p>
            )}

            {comments.map((c) => (
                <div key={c.comment_id} style={{ marginBottom: "10px", textAlign: "left" }}>
                    <span style={{ fontWeight: "bold", fontSize: "14px" }}>{displayName(c)}</span>
                    <span style={{ color: "#999", fontSize: "12px", marginLeft: "8px" }}>
                        {new Date(c.created_at).toLocaleString()}
                    </span>
                    <div style={{ fontSize: "14px", whiteSpace: "pre-wrap" }}>{c.comment_text}</div>
                </div>
            ))}

            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Write a comment..."
                    value={newComment}
                    maxLength={maxCommentLen}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={sending || !newComment.trim()}>
                    {sending ? "Posting..." : "Post"}
                </button>
            </form>

            {error && <p style={{ color: "#dc3545", fontSize: "14px", marginTop: "6px" }}>{error}</p>}
        </div>
    );
};

export default CommentSection;
