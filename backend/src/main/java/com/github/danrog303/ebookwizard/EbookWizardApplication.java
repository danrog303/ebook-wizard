package com.github.danrog303.ebookwizard;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@Slf4j
@SpringBootApplication
public class EbookWizardApplication {

	public static void main(String[] args) {
		log.info("Using Java version: {}", System.getProperty("java.version"));
		SpringApplication.run(EbookWizardApplication.class, args);
	}

}
