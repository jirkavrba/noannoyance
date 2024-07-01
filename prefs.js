import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import GObject from "gi://GObject";
import Adw from "gi://Adw";

import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

const BLOCKLIST_KEY = "blocklist";

export default class Preferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    let settings = this.getSettings();

    const page = new Adw.PreferencesPage({
      title: "General",
      icon_name: "dialog-information-symbolic",
    });

    const group = new Adw.PreferencesGroup({
      title: "Ignored Apps",
      description:
        "Some apps try to grab your attention too often. Block them here!",
    });
    page.add(group);

    const originalBlocklist = settings.get_strv(BLOCKLIST_KEY);
    const newBlocklist = new Set(originalBlocklist);

    const updateBlocklist = () => {
      const newBlocklistArr = Array.from(newBlocklist);
      newBlocklistArr.sort();
      settings.set_strv(BLOCKLIST_KEY, newBlocklistArr);
    };

    const addRow = (value, isNew) => {
      const row = new Adw.ActionRow({
        title: value,
      });

      if (isNew) newBlocklist.add(value);

      const removeButton = new Gtk.Button({
        icon_name: "user-trash-symbolic",
      });
      removeButton.get_style_context().add_class("flat");
      row.add_suffix(removeButton);

      group.add(row);

      removeButton.connect("clicked", () => {
        group.remove(row);
        newBlocklist.delete(row.title);
        updateBlocklist();
      });
    };

    const addOldRow = (value) => {
      addRow(value, false);
    };
    const addNewRow = (value) => {
      addRow(value, true);
    };

    originalBlocklist.forEach(addOldRow);

    const addByWmClass = () => {
      const dialog = new Adw.MessageDialog({
        transient_for: window,
        modal: true,
      });

      dialog.set_heading("Enter WM__CLASS");
      dialog.set_body("If you need help finding the WM__CLASS, press \"Alt + F2\", run \"lg\" in the run opened window, and then click \"Windows\" and search for the 'WM_CLASS' of the apps you want to ignore.");

      const entry = new Adw.EntryRow();
      entry.set_title('WM_CLASS to ignore');
      dialog.set_extra_child(entry);

      dialog.add_response("cancel", "Cancel");
      dialog.add_response("add", "Add");
      dialog.set_default_response("add");
      dialog.set_response_appearance("add", Adw.ResponseAppearance.SUGGESTED);

      dialog.connect("response", (dialog, response) => {
        if (response === "add") {
          const text = entry.get_text();
          if (text) {
            addNewRow(text);
            updateBlocklist();
          }
        }
        dialog.destroy();
      });

      dialog.show();
    };

    const byRawEnter = new Gtk.Button({
      icon_name: "window-new-symbolic",
    });
    byRawEnter.get_style_context().add_class("flat");
    byRawEnter.connect("clicked", addByWmClass);

    group.set_header_suffix(byRawEnter);

    window.add(page);
  }
}
