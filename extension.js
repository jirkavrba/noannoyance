import * as Main from "resource:///org/gnome/shell/ui/main.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import Gio from "gi://Gio";

export default class NoAnnoyance extends Extension {
  constructor(metadata) {
    super(metadata);
    this._settings = null;
    this._blocklist = null;
    this._settingsChangedId = null;
  }

  enable() {
    console.debug("[NoAnnoyance] Disabling 'Window Is Ready' Notification");

    this._settings = this.getSettings();
    this._onSettingsChanged(); // Load the settings for the first time.

    this._windowDemandsAttentionId = global.display.connect(
      "window-demands-attention",
      this._onWindowDemandsAttention.bind(this)
    );

    this._windowMarkedUrgentId = global.display.connect(
      "window-marked-urgent",
      this._onWindowDemandsAttention.bind(this)
    );

    this._settingsChangedId = this._settings.connect(
      "changed::blocklist",
      this._onSettingsChanged.bind(this)
    );
  }

  disable() {
    console.debug("[NoAnnoyance] Enabling 'Window Is Ready' Notification");

    global.display.disconnect(this._windowDemandsAttentionId);
    global.display.disconnect(this._windowMarkedUrgentId);

    if (this._settingsChangedId) {
      this._settings.disconnect(this._settingsChangedId);
      this._settingsChangedId = null;
    }

    this._settings = null;
    this._blocklist = null;
  }

  _onWindowDemandsAttention(display, window) {
    if (!window || window.has_focus() || window.is_skip_taskbar()) return;

    if (!this._blocklist.has(window.get_wm_class())) {
      Main.activateWindow(window);
    }
  }

  _onSettingsChanged() {
    this._blocklist = new Set(this._settings.get_strv("blocklist"));
    console.debug(
      "[NoAnnoyance] Updating blocklist:",
      Array.from(this._blocklist).join(", ")
    );
  }
}
