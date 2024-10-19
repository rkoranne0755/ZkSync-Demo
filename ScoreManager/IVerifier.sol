// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVerifier {
    function verifyTx(
        Proof memory proof,
        uint[2] memory input
    ) external view returns (bool);
}

library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
}

struct Proof {
    Pairing.G1Point a;
    Pairing.G2Point b;
    Pairing.G1Point c;
}