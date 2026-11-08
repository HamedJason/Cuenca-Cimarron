import { vi } from "vitest";
HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
HTMLDialogElement.prototype.close = function () {
  this.open = false;
};
window.matchMedia = vi.fn(() => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
}));
