package main

import (
	"log"
	"net/http"
	"os"

	"proofvault-threshold-extension/internal/extension"
)

func main() {
	http.HandleFunc("/action", extension.HandleAction)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("proofvault threshold extension listening on :%s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
