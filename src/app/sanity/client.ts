import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "8l26zfp0",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});