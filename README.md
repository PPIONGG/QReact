# สร้าง library ด้วย directory structure

nx g @nx/react:lib i18n --directory=libs/shared/i18n --importPath=@qreact/shared-i18n

# สร้าง TypeScript library สำหรับ store

nx g @nx/react:lib store --directory=libs/shared/store

# สร้าง React library สำหรับ UI components

nx g @nx/react:lib ui --directory=libs/shared/ui --bundler=rollup

# สร้าง React Project

nx g @nx/react:app apps/QReactERPc/sales/sales-visitor

# สร้าง CSS/SCSS library

nx g @nx/js:lib styles --directory=libs/shared/styles --bundler=tsc --importPath=@qreact/shared-styles

# สร้าง TypeScript library สำหรับ auth

nx g @nx/react:lib auth --directory=libs/shared/auth

# สร้าง TypeScript library สำหรับ api

nx g @nx/react:lib api --directory=libs/shared/api

# สร้าง TypeScript library สำหรับ tpyes

nx g @nx/react:lib types --directory=libs/shared/types

# สร้าง TypeScript library สำหรับ constants

nx g @nx/react:lib constants --directory=libs/shared/constants