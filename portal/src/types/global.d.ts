declare module 'remote/Button' {
  const Button: React.ComponentType<any>;
  export default Button;
}

declare module 'remote/*' {
  const component: React.ComponentType<any>;
  export default component;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}