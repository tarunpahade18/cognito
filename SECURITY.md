# Security Policy

## Reporting a Vulnerability

Please do not open public issues for security vulnerabilities.

Report suspected vulnerabilities by opening a private GitHub security advisory for this repository. Include a description, impact, reproduction steps, and any suggested fix if available.

## Secrets

Never commit `.env` files, Supabase secrets, OpenAI keys, Lovable gateway keys, or other provider credentials. If a secret is accidentally committed, rotate it immediately and remove it from git history before publishing the repository.
