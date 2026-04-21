package com.veriledger.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final JwtUtil jwtUtil;

    @Value("${google.client.id}")
    private String googleClientId;

    private GoogleIdTokenVerifier verifier;

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            this.verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
        } catch (Exception e) {
            log.error("Failed to initialize GoogleIdTokenVerifier", e);
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String credential = body.get("credential");
        if (credential == null || credential.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing credential"));
        }

        try {
            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid Google token"));
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String userId = payload.getSubject();      // Unique Google user ID
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            String jwt = jwtUtil.generateToken(userId, email, name, picture);

            log.info("User logged in: {} ({})", name, email);

            return ResponseEntity.ok(Map.of(
                    "token", jwt,
                    "userId", userId,
                    "name", name,
                    "email", email,
                    "picture", picture != null ? picture : ""
            ));

        } catch (Exception e) {
            log.error("Google auth error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Authentication failed: " + e.getMessage()));
        }
    }

    @PostMapping("/guest")
    public ResponseEntity<?> guestLogin() {
        String guestId = "guest-" + System.currentTimeMillis();
        String jwt = jwtUtil.generateToken(guestId, "guest@veriledger.demo", "Guest User", "");
        return ResponseEntity.ok(Map.of(
                "token", jwt,
                "userId", guestId,
                "name", "Guest User",
                "email", "guest@veriledger.demo",
                "picture", ""
        ));
    }

    /**
     * Alternative endpoint: accepts Google user info already fetched by frontend
     * using the access token flow (@react-oauth/google useGoogleLogin).
     * We trust the sub/email since the frontend verified via Google's userinfo API.
     * For production, use ID token verification instead.
     */
    @PostMapping("/google-access")
    public ResponseEntity<?> googleAccessLogin(@RequestBody Map<String, String> body) {
        String sub = body.get("sub");
        String email = body.get("email");
        String name = body.getOrDefault("name", "VeriLedger User");
        String picture = body.getOrDefault("picture", "");

        if (sub == null || email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing user info"));
        }

        String jwt = jwtUtil.generateToken(sub, email, name, picture);
        log.info("User via access token: {} ({})", name, email);

        return ResponseEntity.ok(Map.of(
                "token", jwt,
                "userId", sub,
                "name", name,
                "email", email,
                "picture", picture
        ));
    }
}
