package types

type ActionRequest struct {
	OpType    string         `json:"opType"`
	OpCommand string         `json:"opCommand"`
	Action    string         `json:"action"`
	Input     ThresholdInput `json:"input"`
}

type ThresholdInput struct {
	RequestID         string    `json:"requestId"`
	RequiredThreshold float64   `json:"requiredThreshold"`
	AssetValues       []float64 `json:"assetValues"`
	Commitment        string    `json:"commitment"`
}

type ThresholdOutput struct {
	ThresholdMet     bool   `json:"thresholdMet"`
	Outcome          string `json:"outcome"`
	OutputCommitment string `json:"outputCommitment"`
	Timestamp        int64  `json:"timestamp"`
}
