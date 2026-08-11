package extension

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"proofvault-threshold-extension/internal/config"
	pvtypes "proofvault-threshold-extension/pkg/types"
)

func HandleAction(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var request pvtypes.ActionRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	output, err := VerifyReserveThreshold(request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]pvtypes.ThresholdOutput{
		"result": output,
	})
}

func VerifyReserveThreshold(request pvtypes.ActionRequest) (pvtypes.ThresholdOutput, error) {
	if request.OpType != config.OPTypeProofVaultReserve ||
		request.OpCommand != config.OPCommandVerifyReserveThreshold ||
		request.Action != config.ActionVerifyReserveThreshold {
		return pvtypes.ThresholdOutput{}, errors.New("unsupported ProofVault FCC action")
	}

	input := request.Input
	if input.RequestID == "" || input.Commitment == "" {
		return pvtypes.ThresholdOutput{}, errors.New("missing request commitment")
	}

	if input.RequiredThreshold <= 0 {
		return pvtypes.ThresholdOutput{}, errors.New("requiredThreshold must be greater than zero")
	}

	if len(input.AssetValues) == 0 {
		return pvtypes.ThresholdOutput{}, errors.New("assetValues must not be empty")
	}

	var total float64
	for _, value := range input.AssetValues {
		if value < 0 {
			return pvtypes.ThresholdOutput{}, errors.New("assetValues must not contain negative values")
		}
		total += value
	}

	thresholdMet := total >= input.RequiredThreshold
	outcome := "FAIL"
	if thresholdMet {
		outcome = "PASS"
	}

	timestamp := time.Now().Unix()
	return pvtypes.ThresholdOutput{
		ThresholdMet:     thresholdMet,
		Outcome:          outcome,
		OutputCommitment: buildOutputCommitment(input.RequestID, input.Commitment, thresholdMet, outcome, timestamp),
		Timestamp:        timestamp,
	}, nil
}

func buildOutputCommitment(requestID string, commitment string, thresholdMet bool, outcome string, timestamp int64) string {
	payload := map[string]any{
		"requestId":     requestID,
		"commitment":    commitment,
		"thresholdMet":  thresholdMet,
		"outcome":       outcome,
		"timestamp":     timestamp,
		"extensionName": config.ExtensionNameProofVaultThreshold,
	}
	encoded, _ := json.Marshal(payload)
	hash := sha256.Sum256(encoded)
	return "0x" + hex.EncodeToString(hash[:])
}
