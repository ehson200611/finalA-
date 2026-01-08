"use client";
import {
  useGetBlogsQuery,
  useAddBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} from "@/store/slices/blogsApi";
import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import SectionOne from "@/components/SectionOne";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import Errors from "@/components/error/errors";
import Loading from "@/components/loading/loading";

function Blogs() {
  const { data: blogsData, isLoading, isError, refetch } = useGetBlogsQuery();
  const { data: meProfile } = useGetMeProfileQuery();
  const isAdmin = meProfile?.role === "superadmin";

  const [expanded, setExpanded] = useState(new Set());
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("blogPage");

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  const [viewsMap, setViewsMap] = useState({});
  const [addBlog, { isLoading: creating }] = useAddBlogMutation();
  const [updateBlog, { isLoading: updating }] = useUpdateBlogMutation();
  const [deleteBlog, { isLoading: deleting }] = useDeleteBlogMutation();

  useEffect(() => {
    if (blogsData) {
      const initialViews = {};
      blogsData.forEach((blog) => {
        initialViews[blog.id] = blog.views || 0;
      });
      setViewsMap(initialViews);
    }
  }, [blogsData]);

  const toggle = (id) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const openCreateModal = () => {
    setEditMode(false);
    setTitle("");
    setDescription("");
    setMedia("");
    setSelectedBlog(null);
    setModalOpen(true);
  };

  const openEditModal = (blog) => {
    setEditMode(true);
    setTitle(blog.title);
    setDescription(blog.description);
    setMedia(blog.media);
    setSelectedBlog(blog);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title || !description) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    if (media instanceof File) {
      formData.append("media", media);
    }

    try {
      if (editMode && selectedBlog) {
        await updateBlog({ id: selectedBlog.id, formData });
      } else {
        await addBlog(formData);
      }
      setModalOpen(false);
      setTitle("");
      setDescription("");
      setMedia("");
      setSelectedBlog(null);
    } catch (err) {
      console.error("Error saving blog:", err);
    }
  };

  const openDeleteModal = (blog) => {
    setBlogToDelete(blog);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (blogToDelete) {
      await deleteBlog(blogToDelete.id);
      setDeleteModalOpen(false);
      setBlogToDelete(null);
    }
  };

  const handleView = async (blog) => {
    const viewedBlogs = JSON.parse(localStorage.getItem("viewedBlogs") || "[]");
    if (viewedBlogs.includes(blog.id)) return;

    const newViews = (viewsMap[blog.id] || 0) + 1;
    setViewsMap((prev) => ({ ...prev, [blog.id]: newViews }));
    localStorage.setItem(
      "viewedBlogs",
      JSON.stringify([...viewedBlogs, blog.id])
    );

    try {
      const formData = new FormData();
      formData.append("title", blog.title);
      formData.append("description", blog.description);
      formData.append("views", newViews);
      if (blog.media && !(blog.media instanceof File))
        formData.append("media", blog.media);

      await updateBlog({ id: blog.id, formData });
    } catch (err) {
      console.error("Failed to update views", err);
    }
  };

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (isError) {
    return (
      <Errors
        error={isError}
        onRetry={() => window.location.reload()}
        fullScreen
      />
    );
  }

  if (isLoading) return <Loading />;
  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-[#0a1a23] text-white"
          : "bg-linear-to-br from-[#e6f9ff] via-[#f4fbfc] to-[#e8f7f9] text-[#02202B]"
      } font-sans min-h-screen transition-colors duration-400`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <SectionOne title={t("blogs")} description={t("discover")} />

        {isAdmin && (
          <div className="flex justify-end mb-6 px-5">
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={openCreateModal}
              startIcon={<Plus className="w-4 h-4" />}
              className="!rounded-lg !py-2 !px-4"
            >
              {t("add")}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10 px-5">
          {blogsData?.map((blog) => {
            const isVideo = blog.media.endsWith(".mp4");
            const isOpen = expanded.has(blog.id);

            return (
              <div
                key={blog.id}
                className={`rounded-xl overflow-hidden shadow-md ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="w-full max-h-[60vh] sm:max-h-[50vh] md:max-h-[60vh] lg:max-h-[70vh] xl:max-h-[60vh] overflow-hidden rounded-t-xl">
                  {isVideo ? (
                    <video
                      src={blog.media}
                      controls
                      className="w-full h-auto max-h-[70vh] object-contain bg-black rounded-t-xl"
                      onPlay={() => handleView(blog)}
                    />
                  ) : (
                    <img
                      src={blog.media}
                      alt={blog.title}
                      className="w-full h-auto max-h-[70vh] object-contain bg-black rounded-t-xl"
                      onClick={() => handleView(blog)}
                    />
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p
                        className={`font-semibold text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {blog.author || "Admin"} •{" "}
                        {new Date(blog.created_at).toLocaleDateString()} •{" "}
                        {viewsMap[blog.id] || 0} views
                      </p>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-2">
                        <IconButton
                          onClick={() => openEditModal(blog)}
                          size="small"
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: "#b3c0cc",
                            "&:hover": { backgroundColor: "#9aa9b8" },
                            color: "white",
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </IconButton>

                        <IconButton
                          onClick={() => openDeleteModal(blog)}
                          size="small"
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: "#e60000",
                            "&:hover": { backgroundColor: "#cc0000" },
                            color: "white",
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </div>
                    )}
                  </div>

                  <h2
                    className={`text-xl font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {blog.title}
                  </h2>

                  <p
                    className={`text-gray-700 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {isOpen || blog.description.length <= 50
                      ? blog.description
                      : blog.description.slice(0, 50) + "..."}
                    {blog.description.length > 50 && (
                      <button
                        onClick={() => toggle(blog.id)}
                        className="text-blue-600 ml-2"
                      >
                        {isOpen ? t("less") : t("more")}
                      </button>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAdmin && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {editMode ? t("editBlog") : t("createBlog")}
          </DialogTitle>
          <DialogContent className="flex flex-col gap-4">
            <TextField
              label={t("title") || "Title"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
            />
            <TextField
              label={t("description") || "Description"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              type="file"
              onChange={(e) => setMedia(e.target.files[0])}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalOpen(false)} color="secondary">
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={creating || updating || deleting}
            >
              {editMode ? t("update") : t("create")}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {isAdmin && (
        <Dialog
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>{t("deleteBlog")}</DialogTitle>
          <DialogContent>
            <Typography>
              {t("deleteConfirm")} <strong>{blogToDelete?.title}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteModalOpen(false)} color="secondary">
              {t("cancel")}
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              disabled={deleting}
            >
              {t("deleteBlog")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}

export default Blogs;
