# ─────────────────────────────────────────────────────────────
#  Stage 1 — BUILD
#  Uses Maven + JDK 17 to compile and package the Spring Boot app
# ─────────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy only the POM first — lets Docker cache dependency downloads
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Now copy source and build the fat JAR (skip tests for faster image builds)
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─────────────────────────────────────────────────────────────
#  Stage 2 — RUNTIME
#  Lean JRE-only image; copies only the built JAR
# ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

# Non-root user for security
RUN addgroup -S veriledger && adduser -S veriledger -G veriledger
USER veriledger

WORKDIR /app

# Copy the fat JAR from the builder stage
COPY --from=builder /app/target/veriledger-backend-1.0.0.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# JVM tuning for containers + run the app
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
