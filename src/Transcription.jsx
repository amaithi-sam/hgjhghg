import React, { useEffect } from 'react';
import { AnalyzeBatchAction, AzureKeyCredential, TextAnalysisClient } from "@azure/ai-language-text";

const AzureTextSummarization = ({ documents, apiKey, endpoint }) => {
    useEffect(() => {
        const performSummarization = async () => {
            try {
                console.log("== Extractive Summarization Sample ==");

                const client = new TextAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
                const actions = [
                    {
                        kind: "ExtractiveSummarization",
                        maxSentenceCount: 10,
                    },
                ];

                const poller = await client.beginAnalyzeBatch(actions, documents, "en");

                poller.onProgress(() => {
                    console.log(
                        `Last time the operation was updated was on: ${poller.getOperationState().modifiedOn}`
                    );
                });
                console.log(`The operation was created on ${poller.getOperationState().createdOn}`);
                console.log(`The operation results will expire on ${poller.getOperationState().expiresOn}`);

                const results = await poller.pollUntilDone();

                for await (const actionResult of results) {
                    if (actionResult.kind !== "ExtractiveSummarization") {
                        throw new Error(`Expected extractive summarization results but got: ${actionResult.kind}`);
                    }
                    if (actionResult.error) {
                        const { code, message } = actionResult.error;
                        throw new Error(`Unexpected error (${code}): ${message}`);
                    }
                    for (const result of actionResult.results) {
                        console.log(`- Document ${result.id}`);
                        if (result.error) {
                            const { code, message } = result.error;
                            throw new Error(`Unexpected error (${code}): ${message}`);
                        }
                        console.log("Summary:");
                        console.log(result.sentences.map((sentence) => sentence.text).join("\n"));
                    }
                }
            } catch (error) {
                console.error("Error in text summarization:", error);
            }
        };

        if (documents && documents.length > 0 && apiKey && endpoint) {
            performSummarization();
        }
    }, [documents, apiKey, endpoint]);

    return (
        <div>
            <h2>Text Summarization</h2>
            {/* You can add any desired UI components here */}
        </div>
    );
};

export default AzureTextSummarization;
