import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();

interface EcomTemplate {
  id: string;
  platform: string;
  displayName: string;
  description: string;
  logoUrl: string;
  category: string;
  authType: string;
  requiredKeys: string[];
  codeTemplate: string;
}

const ECOM_TEMPLATES: EcomTemplate[] = [
  {
    id: "shopify",
    platform: "shopify",
    displayName: "Shopify Admin API",
    description: "Create and manage products via Shopify Admin REST API",
    logoUrl: "https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-primary.svg",
    category: "ecommerce",
    authType: "api_key",
    requiredKeys: ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ACCESS_TOKEN"],
    codeTemplate: `// Shopify Product Creation
const response = await fetch(
  \`https://\${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products.json\`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
    body: JSON.stringify({
      product: {
        title: "{{product_title}}",
        body_html: "{{product_description}}",
        vendor: "{{vendor_name}}",
        product_type: "{{product_type}}",
        images: [{ src: "{{image_url}}" }],
        variants: [{ price: "{{price}}", sku: "{{sku}}" }],
      },
    }),
  }
);`,
  },
  {
    id: "printify",
    platform: "printify",
    displayName: "Printify POD Upload",
    description: "Upload print-on-demand products to Printify",
    logoUrl: "https://printify.com/wp-content/uploads/2020/11/printify-logo.svg",
    category: "pod",
    authType: "api_key",
    requiredKeys: ["PRINTIFY_API_TOKEN", "PRINTIFY_SHOP_ID"],
    codeTemplate: `// Printify Product Upload
const response = await fetch(
  \`https://api.printify.com/v1/shops/\${PRINTIFY_SHOP_ID}/products.json\`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": \`Bearer \${PRINTIFY_API_TOKEN}\`,
    },
    body: JSON.stringify({
      title: "{{product_title}}",
      description: "{{product_description}}",
      blueprint_id: {{blueprint_id}},
      print_provider_id: {{print_provider_id}},
      variants: [{ id: {{variant_id}}, price: {{price_cents}}, is_enabled: true }],
      print_areas: [{
        variant_ids: [{{variant_id}}],
        placeholders: [{ position: "front", images: [{ id: "{{image_id}}", x: 0.5, y: 0.5, scale: 1 }] }],
      }],
    }),
  }
);`,
  },
  {
    id: "etsy",
    platform: "etsy",
    displayName: "Etsy Listings API v3",
    description: "Create product listings on Etsy marketplace",
    logoUrl: "https://www.etsy.com/assets/images/global/etsy-logo.svg",
    category: "marketplace",
    authType: "oauth",
    requiredKeys: ["ETSY_API_KEY", "ETSY_ACCESS_TOKEN", "ETSY_SHOP_ID"],
    codeTemplate: `// Etsy Listing Creation
const response = await fetch(
  \`https://openapi.etsy.com/v3/application/shops/\${ETSY_SHOP_ID}/listings\`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ETSY_API_KEY,
      "Authorization": \`Bearer \${ETSY_ACCESS_TOKEN}\`,
    },
    body: JSON.stringify({
      quantity: {{quantity}},
      title: "{{product_title}}",
      description: "{{product_description}}",
      price: {{price}},
      taxonomy_id: {{taxonomy_id}},
      who_made: "i_did",
      when_made: "made_to_order",
      is_supply: false,
      shipping_profile_id: {{shipping_profile_id}},
      tags: [{{tags}}],
    }),
  }
);`,
  },
  {
    id: "tiktok-shop",
    platform: "tiktok-shop",
    displayName: "TikTok Shop",
    description: "Upload products to TikTok Shop with HMAC signatures",
    logoUrl: "https://sf-tb-sg.ibytedtos.com/obj/eden-sg/uhtyvueh7nulogpoguhm/tiktok-icon.png",
    category: "social-commerce",
    authType: "api_key",
    requiredKeys: ["TIKTOK_APP_KEY", "TIKTOK_APP_SECRET", "TIKTOK_ACCESS_TOKEN"],
    codeTemplate: `// TikTok Shop Product Upload
import crypto from "crypto";
const timestamp = Math.floor(Date.now() / 1000);
const path = "/api/products";
const signString = \`\${TIKTOK_APP_SECRET}\${path}\${timestamp}\`;
const sign = crypto.createHmac("sha256", TIKTOK_APP_SECRET).update(signString).digest("hex");

const response = await fetch(
  \`https://open-api.tiktokglobalshop.com\${path}?app_key=\${TIKTOK_APP_KEY}&timestamp=\${timestamp}&sign=\${sign}\`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tts-access-token": TIKTOK_ACCESS_TOKEN,
    },
    body: JSON.stringify({
      product_name: "{{product_title}}",
      description: "{{product_description}}",
      category_id: "{{category_id}}",
      images: [{ id: "{{image_id}}" }],
      skus: [{ sales_attributes: [], original_price: "{{price}}", stock_infos: [{ warehouse_id: "{{warehouse_id}}", available_stock: {{stock}} }] }],
    }),
  }
);`,
  },
  {
    id: "amazon-kdp",
    platform: "amazon-kdp",
    displayName: "Amazon KDP",
    description: "Upload merch designs to Amazon via S3 + listing API",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    category: "marketplace",
    authType: "api_key",
    requiredKeys: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_S3_BUCKET"],
    codeTemplate: `// Amazon S3 Upload + KDP Listing
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Upload design file to S3
await s3.send(new PutObjectCommand({
  Bucket: AWS_S3_BUCKET,
  Key: \`designs/\${"{{sku}}"}.png\`,
  Body: designBuffer,
  ContentType: "image/png",
}));

// Design URL for listing
const designUrl = \`https://\${AWS_S3_BUCKET}.s3.amazonaws.com/designs/\${"{{sku}}"}.png\`;`,
  },
  {
    id: "genai-sdk",
    platform: "genai-sdk",
    displayName: "Custom GenAI SDK",
    description: "Node.js SDK for custom AI generation pipelines",
    logoUrl: "",
    category: "ai",
    authType: "api_key",
    requiredKeys: ["OPENAI_API_KEY"],
    codeTemplate: `// Custom GenAI Pipeline
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Generate product description
const textResult = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a product copywriter." },
    { role: "user", content: "Write a description for: {{product_title}}" },
  ],
});

// Generate product image
const imageResult = await openai.images.generate({
  model: "dall-e-3",
  prompt: "{{image_prompt}}",
  size: "1024x1024",
  quality: "hd",
});

const description = textResult.choices[0].message.content;
const imageUrl = imageResult.data[0].url;`,
  },
];

// List all templates
router.get("/", (_req: Request, res: Response) => {
  res.json(
    ECOM_TEMPLATES.map(({ codeTemplate, ...rest }) => rest)
  );
});

// Get template by ID with code
router.get("/:id", (req: Request, res: Response) => {
  const template = ECOM_TEMPLATES.find((t) => t.id === String(req.params.id));
  if (!template) {
    return res.status(404).json({ message: "Template not found" });
  }
  res.json(template);
});

// Generate code with user's stored keys substituted
router.post("/:id/generate", requireAuth, (req: Request, res: Response) => {
  const template = ECOM_TEMPLATES.find((t) => t.id === String(req.params.id));
  if (!template) {
    return res.status(404).json({ message: "Template not found" });
  }

  const { variables } = req.body;
  let code = template.codeTemplate;

  // Substitute user-provided variables
  if (variables && typeof variables === "object") {
    for (const [key, value] of Object.entries(variables)) {
      code = code.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value));
    }
  }

  res.json({
    platform: template.platform,
    generatedCode: code,
    requiredKeys: template.requiredKeys,
  });
});

export default router;
