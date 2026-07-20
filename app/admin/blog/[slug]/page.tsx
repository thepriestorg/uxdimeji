"use client";
import { use } from "react";
import BlogEditor from "@/components/admin/BlogEditor";
export default function EditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = use(params); return <BlogEditor slug={slug} />; }
