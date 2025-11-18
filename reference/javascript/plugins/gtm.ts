import { Application, JSX, ParameterType, RendererEvent } from "typedoc";

/**
 * TypeDoc plugin that injects Google Tag Manager (GTM) script into generated documentation.
 *
 * This plugin adds the GTM container script to the <head> and initializes the data layer
 * in all generated HTML pages.
 *
 * Configuration:
 * Add to build.ts ROOT_TYPEDOC_CONFIG:
 * ```typescript
 * const ROOT_TYPEDOC_CONFIG: TypeDocOptions = {
 *   ...
 *   plugin: ["./plugins/gtm"],
 *   gtmId: "GTM-XXXXXXX",
 * };
 * ```
 */

declare module "typedoc" {
  export interface TypeDocOptionMap {
    gtmId: string;
  }
}

export function load(app: Application) {
  // Register the GTM ID option
  app.options.addDeclaration({
    name: "gtmId",
    help: "Google Tag Manager ID (e.g., GTM-XXXXXXX)",
    type: ParameterType.String,
    defaultValue: "",
  });

  // Hook into the renderer begin event to set up the injection hooks
  app.renderer.on(RendererEvent.BEGIN, () => {
    const gtmId = app.options.getValue("gtmId") as string | undefined;

    if (!gtmId) {
      app.logger.warn(
        "[GTM Plugin] No GTM ID provided. Set 'gtmId' in your TypeDoc configuration."
      );
      return;
    }

    // Validate GTM ID format
    if (!gtmId.match(/^GTM-[A-Z0-9]+$/)) {
      app.logger.error(
        `[GTM Plugin] Invalid GTM ID format: "${gtmId}". Expected format: GTM-XXXXXXX`
      );
      return;
    }

    app.logger.info(`[GTM Plugin] Injecting GTM ID: ${gtmId}`);

    // Hook to inject GTM script into <head>
    app.renderer.hooks.on("head.end", () => {
      const gtmHeadScript = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');</script>
<!-- End Google Tag Manager -->`;

      return JSX.createElement(JSX.Raw, { html: gtmHeadScript });
    });

    // Hook to inject GTM noscript fallback after <body>
    app.renderer.hooks.on("body.begin", () => {
      const gtmBodyScript = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

      return JSX.createElement(JSX.Raw, { html: gtmBodyScript });
    });
  });
}

