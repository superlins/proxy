# proxy

Generate sing-box configuration from multiple subscription sources.

## Architecture

```
pipeline.yaml  →  providers  →  stages  →  template  →  config.json
```

- **providers**: fetch subscription URLs (URI or Clash YAML format)
- **stages**: filter → rename → group (region-based urltest)
- **template**: full sing-box JSON with route rules, DNS, service groups
- **builder**: inject nodes + region groups into template

## Quick Start

### Local

```bash
npm install
cp config/pipeline.sample.yaml config/pipeline.yaml
# edit pipeline.yaml with your subscription URLs
npx tsx src/index.ts config/pipeline.yaml
```

### GitHub Actions (Private Config Repo)

1. Fork this repo or create a new repo with a dependency on it
2. Create `config/pipeline.yaml` with `${SUB_XXX}` env variable placeholders
3. Add GitHub Secrets for your subscription URLs
4. Add `.github/workflows/generate.yml` to pull source + generate config
5. Push to trigger the workflow

## Project Structure

```
src/
  core/       Pipeline executor and config builder
  protocols/  14 protocol parsers + Zod schemas
  providers/  Subscription fetchers (URI, HTTP, Clash YAML)
  middlewares/ Filter, rename, region grouping
config/
  templates/  sing-box JSON templates
  pipeline.sample.yaml  Example pipeline config
```
