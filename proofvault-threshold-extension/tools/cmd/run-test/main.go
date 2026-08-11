package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

func main() {
	endpoint := os.Getenv("FCC_EXTENSION_ENDPOINT")
	if endpoint == "" {
		endpoint = "http://localhost:8080/action"
	}

	payload := map[string]any{
		"opType":    "PROOFVAULT_RESERVE",
		"opCommand": "VERIFY_RESERVE_THRESHOLD",
		"action":    "verifyReserveThreshold",
		"input": map[string]any{
			"requestId":         "proofvault-demo-request",
			"requiredThreshold": 200000,
			"assetValues":       []float64{120000, 100000},
			"commitment":        "0x1111111111111111111111111111111111111111111111111111111111111111",
		},
	}
	body, _ := json.Marshal(payload)
	response, err := http.Post(endpoint, "application/json", bytes.NewReader(body))
	if err != nil {
		panic(err)
	}
	defer response.Body.Close()

	var result map[string]any
	if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
		panic(err)
	}

	fmt.Println(result["result"])
}
