# R470 — Desktop-only Windows installation closure

R470 scopes the existing Windows installer target gate to the native **Desktop Target only**.

It is **not** a prerequisite for Cloud/Workers, Hybrid Link, or canonical cloud promotion. Those surfaces continue under their existing authorities and proof chains.

The Windows installer is needed when the native desktop platform is packaged for delivery. Only that desktop deployment gate requires the paired target-machine sequence:

1. package exact canonical SHA
2. clean install
3. first launch
4. runtime health
5. state-preserving upgrade
6. relaunch
7. uninstall
8. clean reinstall
9. exact installed version/source-SHA verification

Cloud CI may validate this contract and package structure but cannot claim a physical desktop installation occurred.

This preserves R386: the desktop launcher/runtime converges with the same canonical OMEGA and Hybrid Link rather than becoming a separate product.
