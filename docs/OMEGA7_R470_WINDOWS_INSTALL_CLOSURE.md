# R470 — Windows installation closure contract

R470 converts the existing native Windows installer target gate into an explicit fail-closed proof contract.

It does **not** claim that cloud CI installed OMEGA on a physical Windows PC. Installation closes only when the paired target machine archives receipts for the exact canonical source SHA and installer artifact.

Required order:

1. package exact canonical SHA
2. clean install
3. first launch
4. runtime health
5. state-preserving upgrade
6. relaunch
7. uninstall
8. clean reinstall
9. exact installed version/source-SHA verification

Any missing receipt, SHA mismatch, launch failure, upgrade state loss, uninstall failure, or reinstall failure leaves the target gate open.

This preserves the existing R386 rule that native packaging/launcher converges with cloud continuity instead of becoming a separate product.
