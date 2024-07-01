test:
	rm -f noannoyance-fork@vrba.dev.shell-extension.zip
	gnome-extensions pack
	gnome-extensions install noannoyance-fork@vrba.dev.shell-extension.zip --force
	gnome-extensions enable noannoyance-fork@vrba.dev

test_live: test
	dbus-run-session -- gnome-shell --nested --wayland

test_prefs: test
	gnome-extensions prefs noannoyance-fork@vrba.dev

 .PHONY: test
