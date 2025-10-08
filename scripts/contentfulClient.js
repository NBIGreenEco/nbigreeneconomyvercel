import { createClient } from 'contentful';

export const deliveryClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || "zerelkd70urg",
  accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN || "5YmyLiRoDo7XRXolU5C-UVgMRnf9I5FF_6zaN3iAjFs", // Published content
});

export const previewClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || "zerelkd70urg",
  accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN || "DXuuPlvUxGqMpKaRfMH-3GfY5FRLVYbdny6uOTwT4zI", // Draft content
  host: "preview.contentful.com"
});
