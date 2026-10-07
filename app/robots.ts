import type { MetadataRoute } from "next";
import { routes } from "@/lib/routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: routes.root,
      disallow: [routes.app, routes.operator, routes.betaAcknowledgements],
    },
  };
}
