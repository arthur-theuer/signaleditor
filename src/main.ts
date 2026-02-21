import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

// Click anywhere on an .hl-wrap to focus its contained input
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.matches('input, select, button, textarea')) return;
  const wrapper = target.closest('.hl-wrap');
  if (!wrapper) return;
  const input = wrapper.querySelector<HTMLElement>('input, select, textarea, button');
  if (input) input.focus();
});

export default app
