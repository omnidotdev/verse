import { Schema } from "@effect/schema";

// Base schemas for Garden items
export const GardenItem = Schema.struct({
  name: Schema.string,
  homepage_url: Schema.string,
  logo: Schema.string,
  repo_url: Schema.optional(Schema.string),
  project_url: Schema.optional(Schema.string),
  twitter: Schema.optional(Schema.string),
  description: Schema.optional(Schema.string)
});

// Category schemas
export const SubcategorySpec = Schema.struct({
  name: Schema.string,
  icon_color: Schema.optional(Schema.string),
  items: Schema.array(GardenItem)
});

export const CategorySpec = Schema.struct({
  name: Schema.string,
  icon_color: Schema.optional(Schema.string),
  subcategories: Schema.array(SubcategorySpec)
});

// Garden schema (completely independent)
export const GardenSpec = Schema.struct({
  name: Schema.string,
  description: Schema.optional(Schema.string),
  version: Schema.string,
  categories: Schema.array(CategorySpec),
  maintainers: Schema.optional(Schema.array(Schema.struct({
    name: Schema.string,
    email: Schema.optional(Schema.string),
    url: Schema.optional(Schema.string)
  }))),
  created_at: Schema.optional(Schema.string),
  updated_at: Schema.optional(Schema.string),
  theme: Schema.optional(Schema.struct({
    primary_color: Schema.optional(Schema.string),
    secondary_color: Schema.optional(Schema.string),
    background_color: Schema.optional(Schema.string),
    text_color: Schema.optional(Schema.string)
  }))
});

// Type definitions
export type GardenItem = Schema.To<typeof GardenItem>;
export type SubcategorySpec = Schema.To<typeof SubcategorySpec>;
export type CategorySpec = Schema.To<typeof CategorySpec>;
export type GardenSpec = Schema.To<typeof GardenSpec>;

// Sample data with Omni in the center and products around it
export const sampleGarden: GardenSpec = {
  "name": "Omni Garden",
  "description": "Omni product ecosystem",
  "version": "1.0.0",
  "categories": [
    {
      "name": "Productivity",
      "subcategories": [
        {
          "name": "Task Management",
          "icon_color": "hsl(var(--chart-1))",
          "items": [
            {
              "name": "Product A",
              "homepage_url": "https://example.com/product-a",
              "project_url": "https://github.com/example/product-a",
              "logo": "https://via.placeholder.com/150?text=A",
              "description": "Task management solution"
            },
            {
              "name": "Product B",
              "homepage_url": "https://example.com/product-b",
              "project_url": "https://github.com/example/product-b",
              "logo": "https://via.placeholder.com/150?text=B",
              "description": "Team collaboration tool"
            }
          ]
        },
        {
          "name": "Note Taking",
          "icon_color": "hsl(var(--chart-2))",
          "items": [
            {
              "name": "Product C",
              "homepage_url": "https://example.com/product-c",
              "project_url": "https://github.com/example/product-c",
              "logo": "https://via.placeholder.com/150?text=C",
              "description": "Smart note-taking app"
            }
          ]
        }
      ]
    },
    {
      "name": "Development",
      "icon_color": "hsl(var(--chart-3))",
      "subcategories": [
        {
          "name": "Code Editors",
          "items": [
            {
              "name": "Product D",
              "homepage_url": "https://example.com/product-d",
              "project_url": "https://github.com/example/product-d",
              "logo": "https://via.placeholder.com/150?text=D",
              "description": "Intelligent code editor"
            },
            {
              "name": "Product E",
              "homepage_url": "https://example.com/product-e",
              "project_url": "https://github.com/example/product-e",
              "logo": "https://via.placeholder.com/150?text=E",
              "description": "Collaborative IDE"
            }
          ]
        },
        {
          "name": "Version Control",
          "items": [
            {
              "name": "Product F",
              "homepage_url": "https://example.com/product-f",
              "project_url": "https://github.com/example/product-f",
              "logo": "https://via.placeholder.com/150?text=F",
              "description": "Git client with advanced features"
            }
          ]
        }
      ]
    },
    {
      "name": "Communication",
      "icon_color": "hsl(var(--chart-4))",
      "subcategories": [
        {
          "name": "Messaging",
          "items": [
            {
              "name": "Product G",
              "homepage_url": "https://example.com/product-g",
              "project_url": "https://github.com/example/product-g",
              "logo": "https://via.placeholder.com/150?text=G",
              "description": "Team chat platform"
            }
          ]
        },
        {
          "name": "Video Conferencing",
          "items": [
            {
              "name": "Product H",
              "homepage_url": "https://example.com/product-h",
              "project_url": "https://github.com/example/product-h",
              "logo": "https://via.placeholder.com/150?text=H",
              "description": "HD video meetings"
            }
          ]
        }
      ]
    },
    {
      "name": "Design",
      "icon_color": "hsl(var(--chart-5))",
      "subcategories": [
        {
          "name": "UI/UX",
          "items": [
            {
              "name": "Product I",
              "homepage_url": "https://example.com/product-i",
              "project_url": "https://github.com/example/product-i",
              "logo": "https://via.placeholder.com/150?text=I",
              "description": "Design and prototyping tool"
            }
          ]
        },
        {
          "name": "Graphics",
          "items": [
            {
              "name": "Product J",
              "homepage_url": "https://example.com/product-j",
              "project_url": "https://github.com/example/product-j",
              "logo": "https://via.placeholder.com/150?text=J",
              "description": "Vector graphics editor"
            }
          ]
        }
      ]
    }
  ],
  "maintainers": [
    {
      "name": "Omni Team",
      "email": "team@omni.example",
      "url": "https://omni.example"
    }
  ],
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",
  "theme": {
    "primary_color": "#6366F1",
    "secondary_color": "#A5B4FC",
    "background_color": "#F9FAFB",
    "text_color": "#111827"
  }
}