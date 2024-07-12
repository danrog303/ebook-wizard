package com.github.danrog303.ebookwizard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EbookWizardApplication {

	public static void main(String[] args) {
		System.out.println(System.getProperty("java.version"));
		SpringApplication.run(EbookWizardApplication.class, args);
	}

}
