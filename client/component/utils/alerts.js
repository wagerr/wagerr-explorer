import Popup from "react-popup";

export function alertPopup(content) {
  Popup.create({
    content: content,
    className: "popover",
    noOverlay: true,
  });
}
