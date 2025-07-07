# สร้าง library ด้วย directory structure

nx g @nx/react:lib i18n --directory=libs/shared/i18n --importPath=@myorg/shared-i18n

# สร้าง TypeScript library สำหรับ store

nx g @nx/js:lib store --directory=libs/shared/store --bundler=tsc

# สร้าง React library สำหรับ UI components

nx g @nx/react:lib ui --directory=libs/shared/ui --bundler=rollup

# สร้าง React Project

nx g @nx/react:app apps/QReactERPc/sales/sales-visitor

# สร้าง CSS/SCSS library

nx g @nx/js:lib styles --directory=libs/shared/styles --bundler=tsc --importPath=@qreact/shared-styles