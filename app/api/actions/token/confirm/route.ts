import {
  createActionHeaders,
  NextActionPostRequest,
  ActionError,
  CompletedAction,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
} from "@solana/web3.js";

const headers = createActionHeaders({
  chainId: 'devnet',
  actionVersion: '2.2.1',
});


export const GET = async () => {
  return Response.json({ message: "Method not supported" } as ActionError, {
    status: 403,
    headers,
  });
};

export const OPTIONS = async () => Response.json(null, { headers });

export const POST = async (req: Request) => {
  try {
    const body: NextActionPostRequest = await req.json();

    // Validate signature
    const signature = body.signature;
    if (!signature) {
      throw 'No "signature" provided in request';
    }

    const connection = new Connection(process.env.SOLANA_RPC || clusterApiUrl("devnet"));

    // Confirm the transaction (token minting)
    const status = await connection.getSignatureStatus(signature);
    if (
      !status ||
      !status.value ||
      !status.value.confirmationStatus ||
      !['confirmed', 'finalized'].includes(status.value.confirmationStatus)
    ) {
      throw "Unable to confirm the transaction";
    }

    console.log("Confirm route triggered! Signature:", signature);

    // Show user a success message
    const payload: CompletedAction = {
      type: "completed",
      title: "Token Created!",
      icon: new URL("/tukn-img.png", new URL(req.url).origin).toString(),
      label: "Success",
      description: "Your new token has been successfully created and minted to your wallet.",
    };
    return Response.json(payload, { headers });

  } catch (err) {
    console.error(err);
    const actionError: ActionError = { message: "An unknown error occurred" };
    if (typeof err == "string") actionError.message = err;
    return Response.json(actionError, {
      status: 400,
      headers,
    });
  }
};
