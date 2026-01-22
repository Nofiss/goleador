using Goleador.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace Goleador.Api.Infrastructure;

public static class DbSeeder
{
    public static async Task SeedUsersAndRolesAsync(IServiceProvider serviceProvider)
    {
        RoleManager<IdentityRole> roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        UserManager<ApplicationUser> userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        IConfiguration configuration = serviceProvider.GetRequiredService<IConfiguration>();

        // Crea Ruoli
        string[] roleNames = ["Admin", "Referee", "Player"];
        foreach (var roleName in roleNames)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        // Crea Super Admin
        var adminEmail = "admin@goleador.com";
        ApplicationUser? adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            var adminPassword = configuration["Seed:AdminPassword"] ?? "Admin123!"; // Default per dev
            var newAdmin = new ApplicationUser { UserName = adminEmail, Email = adminEmail };
            IdentityResult result = await userManager.CreateAsync(newAdmin, adminPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(newAdmin, "Admin");
            }
        }

        // Crea Arbitro Esempio
        var refEmail = "ref@goleador.com";
        if (await userManager.FindByEmailAsync(refEmail) == null)
        {
            var refPassword = configuration["Seed:RefereePassword"] ?? "Referee123!"; // Default per dev
            var newRef = new ApplicationUser { UserName = refEmail, Email = refEmail };
            await userManager.CreateAsync(newRef, refPassword);
            await userManager.AddToRoleAsync(newRef, "Referee");
        }
    }
}
