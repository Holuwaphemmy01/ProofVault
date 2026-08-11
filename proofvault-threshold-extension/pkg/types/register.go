package types

// RegisterDecoders is where the official scaffold registers OPType/OPCommand
// message and result decoders for its types server. ProofVault keeps the hook
// in place so the extension can be dropped into the scaffold without changing
// command names.
func RegisterDecoders() {}
