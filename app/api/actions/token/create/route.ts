import {
  ActionGetResponse,
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
} from "@solana/actions";

import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import {
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";

//Metaplex Token Metadata Program ID
export const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);


const headers = createActionHeaders({
  chainId: "devnet",
  actionVersion: "2.2.1",
});

// GET handler
export const GET = async (req: Request) => {
  const payload: ActionGetResponse = {
    title: "Launch your Token straight from your Socials",
    icon: new URL("/tukn-img.png", new URL(req.url).origin).toString(),
    description: "Create your Solana token in seconds! Name it, style it, and bring it to life — all in one blink, directly from your socials.",
    label: "Create Token",
    links: {
      actions: [
        {
          label: "Create Token",
          type: "transaction",
          href: `${req.url}?tokenName={tokenName}&tokenSymbol={tokenSymbol}&decimals={decimals}&initialSupply={initialSupply}&tokenDescription={tokenDescription}&tokenLogoURL={tokenLogoURL}`,
          parameters: [
            { type: "text", name: "tokenName", label: "Token Name", required: true },
            { type: "text", name: "tokenSymbol", label: "Token Symbol", required: true },
            {
              type: "select",
              name: "decimals",
              label: "Decimals",
              required: true,
              options: Array.from({ length: 7 }, (_, i) => ({
                label: `${i}`,
                value: `${i}`,
              })),
            },
            { type: "text", name: "initialSupply", label: "Initial Supply", required: true },
            { type: "text", name: "tokenDescription", label: "Token Description", required: true },
            { type: "text", name: "tokenLogoURL", label: "Token Logo (Direct URL with .jpg/.png extension)", required: true },
          ],
        },
      ],
    },
  };
  return Response.json(payload, { headers });
};

export const OPTIONS = async () => new Response(null, { headers });



//========================================
// POST handler
//========================================

export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const body: any = await req.json();

    if (!body.account) {
      return Response.json({ error: "User wallet not provided" }, { status: 400, headers });
    }

    const userPubkey = new PublicKey(body.account);
    const tokenName = url.searchParams.get("tokenName") || "";
    const tokenSymbol = url.searchParams.get("tokenSymbol") || "";
    const tokenDescription = url.searchParams.get("tokenDescription") || "";
    const tokenLogoURL = url.searchParams.get("tokenLogoURL") || "";
    const decimals = parseInt(url.searchParams.get("decimals") || "0");
    const initialSupplyRaw = url.searchParams.get("initialSupply");

    if (!tokenName || !tokenSymbol || !initialSupplyRaw) {
      return Response.json({ error: "Missing token parameters" }, { status: 400, headers });
    }

    const initialSupply = BigInt(initialSupplyRaw);
    if (decimals < 0 || decimals > 6 || initialSupply <= 0n) {
      return Response.json({ error: "Invalid token parameters" }, { status: 400, headers });
    }

    const connection = new Connection(process.env.SOLANA_RPC || clusterApiUrl("devnet"));
    const mintKeypair = Keypair.generate();

    const userTokenAccount = getAssociatedTokenAddressSync(
      mintKeypair.publicKey,
      userPubkey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const actualSupply = initialSupply * BigInt(10 ** decimals);
    const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
    const { blockhash } = await connection.getLatestBlockhash();
    const tx = new Transaction({ feePayer: userPubkey, recentBlockhash: blockhash });

    //Metadata JSON to Pinata (IPFS)
    const metadataJSON = {
      name: tokenName,
      symbol: tokenSymbol,
      description: tokenDescription || "A token created via Tukn Blink!",
      image: tokenLogoURL,
      attributes: [],
      extensions: { },
    };

    const pinataRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: JSON.stringify(metadataJSON),
    });

    if (!pinataRes.ok) {
      const errText = await pinataRes.text();
      console.error("Pinata upload failed:", errText);
      throw new Error("Pinata upload failed");
    }

    const pinataData = await pinataRes.json();
    const metadataUri = `https://gateway.pinata.cloud/ipfs/${pinataData.IpfsHash}`;


    //SPL Token Creation Instructions
    tx.add(
      SystemProgram.createAccount({
        fromPubkey: userPubkey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        userPubkey,
        userPubkey,
        TOKEN_PROGRAM_ID
      ),
      createAssociatedTokenAccountInstruction(
        userPubkey,
        userTokenAccount,
        userPubkey,
        mintKeypair.publicKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      ),
      createMintToInstruction(
        mintKeypair.publicKey,
        userTokenAccount,
        userPubkey,
        actualSupply,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    //Create Metadata Account
    const mplProgramId = MPL_TOKEN_METADATA_PROGRAM_ID;

    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        mplProgramId.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      mplProgramId
    );

    const metadataData = {
      name: tokenName,
      symbol: tokenSymbol,
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      creators: [
        {
          address: userPubkey,
          verified: false,
          share: 100,
        },
      ],
      collection: null,
      uses: null,
    };

    const metadataInstruction = createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA,
        mint: mintKeypair.publicKey,
        mintAuthority: userPubkey,
        payer: userPubkey,
        updateAuthority: userPubkey,
      },
      {
        createMetadataAccountArgsV3: {
          data: metadataData,
          isMutable: true,
          collectionDetails: null,
        },
      }
    );

    tx.add(metadataInstruction);

    tx.partialSign(mintKeypair);

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction: tx,
        message: `Token created successfully!
Mint: ${mintKeypair.publicKey.toBase58()}
View Mint on Solana Explorer: https://explorer.solana.com/address/${mintKeypair.publicKey.toBase58()}?cluster=devnet`,
      },
    });



    return Response.json(payload, { headers });
  } catch (err) {
    console.error("Internal Server Error:", err);
    return Response.json({ message: "Internal server error" }, { status: 500, headers });
  }
};
