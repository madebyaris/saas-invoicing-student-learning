package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	DatabaseURL string `mapstructure:"DATABASE_URL"`
	JWTSecret   string `mapstructure:"JWT_SECRET"`
	Port        string `mapstructure:"PORT"`
	Environment string `mapstructure:"GIN_MODE"`
}

func Load() *Config {
	// Set default values
	viper.SetDefault("DATABASE_URL", "postgres://postgres:password@localhost:5432/invoicing?sslmode=disable")
	viper.SetDefault("JWT_SECRET", "your-super-secret-jwt-key-change-in-production")
	viper.SetDefault("PORT", "8080")
	viper.SetDefault("GIN_MODE", "debug")

	// Read from environment variables
	viper.AutomaticEnv()

	// Create config struct
	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		panic("Failed to load configuration: " + err.Error())
	}

	return &config
}
