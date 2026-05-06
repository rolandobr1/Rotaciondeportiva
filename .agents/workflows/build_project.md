# Build Project Workflow

This workflow describes how to install dependencies and build the Court Commander project.

## Steps

1. **Install Dependencies**
   Run the following command to install all necessary npm packages:
   ```powershell
   npm.cmd install
   ```
   *Note: Using `npm.cmd` avoids issues with PowerShell execution policies.*

2. **Build for Production**
   To create a production build of the Next.js application:
   ```powershell
   npm.cmd run build
   ```

3. **Type Checking**
   To run TypeScript type checks:
   ```powershell
   npm.cmd run typecheck
   ```
