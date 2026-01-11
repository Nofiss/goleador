using Goleador.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace Goleador.Api.Infrastructure;

public static class DbSeeder
{
    public static async Task SeedUsersAndRolesAsync(IServiceProvider serviceProvider)
    {
        RoleManager<IdentityRole> roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        UserManager<ApplicationUser> userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        // Crea Ruoli
        string[] roleNames = ["Admin", "Referee"];
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
            var newAdmin = new ApplicationUser { UserName = adminEmail, Email = adminEmail };
            IdentityResult result = await userManager.CreateAsync(newAdmin, "Admin123!"); // Password forte
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(newAdmin, "Admin");
            }
        }

        // Crea Arbitro Esempio
        var refEmail = "ref@goleador.com";
        if (await userManager.FindByEmailAsync(refEmail) == null)
        {
            var newRef = new ApplicationUser { UserName = refEmail, Email = refEmail };
            await userManager.CreateAsync(newRef, "Referee123!");
            await userManager.AddToRoleAsync(newRef, "Referee");
        }
    }
}
